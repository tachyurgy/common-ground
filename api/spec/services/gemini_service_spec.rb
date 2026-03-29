require 'rails_helper'

RSpec.describe GeminiService do
  let(:service) { described_class.new }

  let(:gemini_url) { %r{https://generativelanguage\.googleapis\.com/v1beta/models/gemini-2\.5-flash:generateContent} }

  def stub_gemini(response_text)
    stub_request(:post, gemini_url).to_return(
      status: 200,
      body: {
        candidates: [{
          content: { parts: [{ text: response_text }] }
        }]
      }.to_json,
      headers: { 'Content-Type' => 'application/json' }
    )
  end

  def stub_gemini_error(status_code, body = 'Error')
    stub_request(:post, gemini_url).to_return(status: status_code, body: body)
  end

  describe '#generate_contract' do
    let(:responses) do
      [
        { question: 'What matters?', transcription: 'Communication and respect.' },
        { question: 'What bothers you?', transcription: 'Leaving dishes in the sink.' }
      ]
    end

    let(:contract_text) { "## Behavioral Contract\n\nYou will communicate openly..." }

    before { stub_gemini(contract_text) }

    it 'returns the generated contract text' do
      result = service.generate_contract(responses)
      expect(result).to eq(contract_text)
    end

    it 'sends the response context to Gemini' do
      service.generate_contract(responses)

      expect(WebMock).to have_requested(:post, gemini_url)
        .with { |req|
          body = JSON.parse(req.body)
          user_text = body['contents'][0]['parts'][0]['text']
          user_text.include?('Communication and respect') &&
          user_text.include?('Leaving dishes')
        }
    end

    it 'includes system instructions for a new contract' do
      service.generate_contract(responses)

      expect(WebMock).to have_requested(:post, gemini_url)
        .with { |req|
          body = JSON.parse(req.body)
          system_text = body['system_instruction']['parts'][0]['text']
          system_text.include?('behavioral agreement facilitator') &&
          system_text.include?('Specific Behavioral Commitments')
        }
    end

    context 'with an existing contract' do
      let(:existing) { "## Old Contract\n\nPrevious content here." }

      it 'includes the existing contract in the system prompt for amendment' do
        service.generate_contract(responses, existing_contract: existing)

        expect(WebMock).to have_requested(:post, gemini_url)
          .with { |req|
            body = JSON.parse(req.body)
            system_text = body['system_instruction']['parts'][0]['text']
            system_text.include?('Previous content here') &&
            system_text.include?('amend')
          }
      end
    end

    context 'when Gemini API errors' do
      before { stub_gemini_error(500, 'Internal error') }

      it 'raises a GeminiError' do
        expect {
          service.generate_contract(responses)
        }.to raise_error(GeminiService::GeminiError, /500/)
      end
    end
  end

  describe '#generate_follow_ups' do
    let(:responses) do
      [{ question: 'What matters?', transcription: 'Communication.' }]
    end

    let(:follow_ups_json) do
      [
        { question: 'How often should you check in?', context: 'Regular check-ins strengthen agreements.' },
        { question: 'What happens when someone breaks a rule?', context: 'Conflict resolution is important.' }
      ].to_json
    end

    before { stub_gemini(follow_ups_json) }

    it 'returns parsed follow-up questions as an array' do
      result = service.generate_follow_ups(responses)

      expect(result).to be_an(Array)
      expect(result.length).to eq(2)
      expect(result[0]['question']).to include('check in')
      expect(result[0]['context']).to be_present
    end

    context 'when response is wrapped in markdown code fences' do
      before { stub_gemini("```json\n#{follow_ups_json}\n```") }

      it 'strips the code fences and parses correctly' do
        result = service.generate_follow_ups(responses)
        expect(result).to be_an(Array)
        expect(result.length).to eq(2)
      end
    end

    context 'when the API returns unparseable text' do
      before { stub_gemini('This is not JSON at all') }

      it 'returns an empty array' do
        result = service.generate_follow_ups(responses)
        expect(result).to eq([])
      end
    end

    context 'with an existing contract' do
      it 'includes the contract in the system prompt' do
        service.generate_follow_ups(responses, existing_contract: 'Existing agreement text')

        expect(WebMock).to have_requested(:post, gemini_url)
          .with { |req|
            body = JSON.parse(req.body)
            system_text = body['system_instruction']['parts'][0]['text']
            system_text.include?('Existing agreement text')
          }
      end
    end
  end

  describe '#generate_voice_prompt' do
    let(:agreement) { create(:agreement) }
    let(:prompt_text) { "Tell me about what's been on your mind regarding your living situation." }

    before { stub_gemini(prompt_text) }

    it 'returns the generated prompt text' do
      result = service.generate_voice_prompt(agreement)
      expect(result).to eq(prompt_text)
    end

    it 'sends system instructions for voice prompt generation' do
      service.generate_voice_prompt(agreement)

      expect(WebMock).to have_requested(:post, gemini_url)
        .with { |req|
          body = JSON.parse(req.body)
          system_text = body['system_instruction']['parts'][0]['text']
          system_text.include?('voice conversation') &&
          system_text.include?('new agreement session')
        }
    end

    context 'with amendment context' do
      it 'includes the amendment context in the prompt' do
        service.generate_voice_prompt(agreement, amendment_context: 'chore schedule')

        expect(WebMock).to have_requested(:post, gemini_url)
          .with { |req|
            body = JSON.parse(req.body)
            system_text = body['system_instruction']['parts'][0]['text']
            system_text.include?('chore schedule')
          }
      end
    end

    context 'with an existing version on the agreement' do
      before do
        create(:agreement_version, agreement: agreement, version_number: 1, content: 'Current contract content')
      end

      it 'includes the current version content' do
        service.generate_voice_prompt(agreement)

        expect(WebMock).to have_requested(:post, gemini_url)
          .with { |req|
            body = JSON.parse(req.body)
            system_text = body['system_instruction']['parts'][0]['text']
            system_text.include?('Current contract content')
          }
      end
    end

    context 'when Gemini returns an error' do
      before { stub_gemini_error(403, 'Forbidden') }

      it 'raises a GeminiError' do
        expect {
          service.generate_voice_prompt(agreement)
        }.to raise_error(GeminiService::GeminiError, /403/)
      end
    end
  end
end
