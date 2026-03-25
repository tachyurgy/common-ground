import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../Landing';

function renderLanding() {
  return render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );
}

describe('Landing', () => {
  it('renders the main heading', () => {
    renderLanding();
    expect(screen.getByText('Common Ground')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    renderLanding();
    expect(
      screen.getByText('Turn difficult conversations into clear, actionable agreements.')
    ).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    renderLanding();
    expect(screen.getByText('Start a New Agreement')).toBeInTheDocument();
    expect(screen.getByText('Learn How It Works')).toBeInTheDocument();
  });

  it('CTA links point to correct routes', () => {
    renderLanding();
    expect(screen.getByText('Start a New Agreement').closest('a')).toHaveAttribute(
      'href',
      '/new'
    );
    expect(screen.getByText('Learn How It Works').closest('a')).toHaveAttribute(
      'href',
      '/about'
    );
  });

  it('renders feature sections', () => {
    renderLanding();
    expect(screen.getByText('Voice-First')).toBeInTheDocument();
    expect(screen.getByText('Structured Output')).toBeInTheDocument();
    expect(screen.getByText('Living Document')).toBeInTheDocument();
  });

  it('renders descriptions for each feature', () => {
    renderLanding();
    expect(screen.getByText(/Speak naturally/)).toBeInTheDocument();
    expect(screen.getByText(/Raw conversation gets transformed/)).toBeInTheDocument();
    expect(screen.getByText(/Agreements evolve/)).toBeInTheDocument();
  });
});
