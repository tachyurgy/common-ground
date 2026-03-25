import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from '../About';

describe('About', () => {
  it('renders the page heading', () => {
    render(<About />);
    expect(screen.getByText('What Is This?')).toBeInTheDocument();
  });

  it('renders the How It Works section', () => {
    render(<About />);
    expect(screen.getByText('How It Works')).toBeInTheDocument();
  });

  it('renders the Who Is It For section', () => {
    render(<About />);
    expect(screen.getByText('Who Is It For?')).toBeInTheDocument();
  });

  it('contains description text about Common Ground', () => {
    render(<About />);
    expect(
      screen.getByText(/Common Ground is a lightweight tool/)
    ).toBeInTheDocument();
  });

  it('describes behavioral contracts', () => {
    render(<About />);
    expect(
      screen.getByText(/behavioral contracts work/)
    ).toBeInTheDocument();
  });

  it('explains the voice-based interaction', () => {
    render(<About />);
    expect(
      screen.getByText(/You start a new agreement session/)
    ).toBeInTheDocument();
  });
});
