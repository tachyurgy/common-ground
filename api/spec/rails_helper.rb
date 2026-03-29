require 'spec_helper'
require 'simplecov'
SimpleCov.start 'rails' do
  add_filter '/spec/'
  add_filter '/config/'
  add_filter '/db/'
  add_group 'Models', 'app/models'
  add_group 'Controllers', 'app/controllers'
  add_group 'Services', 'app/services'
  add_group 'Jobs', 'app/jobs'
end

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'rspec/rails'
require 'webmock/rspec'

# Disable all external HTTP connections in tests
WebMock.disable_net_connect!(allow_localhost: true)

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  config.fixture_paths = [
    Rails.root.join('spec/fixtures')
  ]

  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!

  # FactoryBot
  config.include FactoryBot::Syntax::Methods

  # DatabaseCleaner
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end

  # ActiveJob inline execution for tests by default
  config.before(:each) do
    ActiveJob::Base.queue_adapter = :test
  end

  # Stub AWS credentials globally so S3Service.new doesn't blow up
  config.before(:each) do
    ENV['AWS_ACCESS_KEY_ID'] ||= 'test-key'
    ENV['AWS_SECRET_ACCESS_KEY'] ||= 'test-secret'
    ENV['S3_BUCKET'] ||= 'test-bucket'
    ENV['GROQ_API_KEY'] ||= 'test-groq-key'
    ENV['GEMINI_API_KEY'] ||= 'test-gemini-key'
  end
end

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
