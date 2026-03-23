import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContractView from '../ContractView';
import type { AgreementVersion } from '../../types';

const mockVersion: AgreementVersion = {
  id: 1,
  version_number: 1,
  content: '# Agreement\n\nThis is the contract content.',
  change_summary: 'Initial version',
  created_at: '2026-04-01T12:00:00Z',
};

const mockVersions: AgreementVersion[] = [
  mockVersion,
  {
    id: 2,
    version_number: 2,
    content: '# Updated Agreement\n\nRevised content.',
    change_summary: 'Added communication section',
    created_at: '2026-04-02T12:00:00Z',
  },
];

describe('ContractView', () => {
  it('renders empty state when version is null', () => {
    render(<ContractView version={null} />);
    expect(
      screen.getByText('No contract generated yet. Start by answering the guided questions.')
    ).toBeInTheDocument();
  });

  it('renders contract content in markdown', () => {
    render(<ContractView version={mockVersion} />);
    expect(screen.getByText('Agreement')).toBeInTheDocument();
    expect(screen.getByText('This is the contract content.')).toBeInTheDocument();
  });

  it('displays version badge and date', () => {
    const { container } = render(<ContractView version={mockVersion} />);
    const badge = container.querySelector('.version-badge');
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toBe('v1');
    expect(screen.getByText('Initial version')).toBeInTheDocument();
  });

  it('displays Behavioral Agreement heading', () => {
    render(<ContractView version={mockVersion} />);
    expect(screen.getByText('Behavioral Agreement')).toBeInTheDocument();
  });

  it('shows version selector when multiple versions exist', () => {
    const { container } = render(
      <ContractView
        version={mockVersion}
        allVersions={mockVersions}
        onVersionSelect={vi.fn()}
      />
    );
    const selector = container.querySelector('.version-selector');
    expect(selector).toBeInTheDocument();
    const tabs = selector?.querySelectorAll('.version-tab');
    expect(tabs).toHaveLength(2);
  });

  it('does not show version selector for single version', () => {
    const { container } = render(
      <ContractView
        version={mockVersion}
        allVersions={[mockVersion]}
        onVersionSelect={vi.fn()}
      />
    );
    const selector = container.querySelector('.version-selector');
    expect(selector).not.toBeInTheDocument();
  });

  it('calls onVersionSelect when a version tab is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <ContractView
        version={mockVersion}
        allVersions={mockVersions}
        onVersionSelect={onSelect}
      />
    );

    const tabs = container.querySelectorAll('.version-tab');
    // Click the second tab (v2)
    await user.click(tabs[1]);

    expect(onSelect).toHaveBeenCalledWith(mockVersions[1]);
  });

  it('marks the active version tab', () => {
    const { container } = render(
      <ContractView
        version={mockVersion}
        allVersions={mockVersions}
        onVersionSelect={vi.fn()}
      />
    );
    const activeTab = container.querySelector('.version-tab.active');
    expect(activeTab).toBeInTheDocument();
    expect(activeTab?.textContent).toBe('v1');
  });

  it('does not show version selector when onVersionSelect is not provided', () => {
    const { container } = render(
      <ContractView
        version={mockVersion}
        allVersions={mockVersions}
      />
    );
    const selector = container.querySelector('.version-selector');
    expect(selector).not.toBeInTheDocument();
  });
});
