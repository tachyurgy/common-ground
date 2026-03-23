import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';

function renderSidebar(agreementId?: number) {
  return render(
    <MemoryRouter>
      <Sidebar agreementId={agreementId} />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('renders the brand link', () => {
    renderSidebar();
    expect(screen.getByText('Common Ground')).toBeInTheDocument();
  });

  it('renders About section links', () => {
    renderSidebar();
    expect(screen.getByText('What Is This?')).toBeInTheDocument();
    expect(screen.getByText('The Story')).toBeInTheDocument();
    expect(screen.getByText('Tech Stack')).toBeInTheDocument();
  });

  it('renders Start New link', () => {
    renderSidebar();
    expect(screen.getByText('Start New')).toBeInTheDocument();
  });

  it('does not render agreement links when no agreementId', () => {
    renderSidebar();
    expect(screen.queryByText('Current Session')).not.toBeInTheDocument();
    expect(screen.queryByText('View Contract')).not.toBeInTheDocument();
    expect(screen.queryByText('Version History')).not.toBeInTheDocument();
    expect(screen.queryByText('All Responses')).not.toBeInTheDocument();
  });

  it('renders agreement links when agreementId is provided', () => {
    renderSidebar(42);
    expect(screen.getByText('Current Session')).toBeInTheDocument();
    expect(screen.getByText('View Contract')).toBeInTheDocument();
    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('All Responses')).toBeInTheDocument();
  });

  it('links to correct agreement paths', () => {
    renderSidebar(7);
    expect(screen.getByText('Current Session').closest('a')).toHaveAttribute(
      'href',
      '/agreement/7'
    );
    expect(screen.getByText('View Contract').closest('a')).toHaveAttribute(
      'href',
      '/agreement/7/contract'
    );
    expect(screen.getByText('Version History').closest('a')).toHaveAttribute(
      'href',
      '/agreement/7/history'
    );
    expect(screen.getByText('All Responses').closest('a')).toHaveAttribute(
      'href',
      '/agreement/7/responses'
    );
  });

  it('renders section headings', () => {
    renderSidebar();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Agreement')).toBeInTheDocument();
  });
});
