import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button Variants', () => {
  it('renders celebration variant with correct styling', () => {
    render(<Button variant="celebration">Celebration Button</Button>);
    const button = screen.getByRole('button', { name: /celebration button/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gradient-to-r', 'from-amber-400', 'to-amber-600', 'text-amber-950');
  });

  it('renders share variant with correct styling', () => {
    render(<Button variant="share">Share Button</Button>);
    const button = screen.getByRole('button', { name: /share button/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-zinc-950', 'text-white', 'border', 'border-zinc-800');
  });

  it('renders cta variant with correct styling', () => {
    render(<Button variant="cta">CTA Button</Button>);
    const button = screen.getByRole('button', { name: /cta button/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gradient-to-r', 'from-green-500', 'to-green-600', 'text-white');
  });

  it('applies hover effects correctly', () => {
    render(<Button variant="celebration">Hover Test</Button>);
    const button = screen.getByRole('button', { name: /hover test/i });
    
    expect(button).toHaveClass('hover:shadow-amber-500/25', 'hover:scale-105');
  });

  it('includes transition animations', () => {
    render(<Button variant="share">Transition Test</Button>);
    const button = screen.getByRole('button', { name: /transition test/i });
    
    expect(button).toHaveClass('transition-all', 'duration-300');
  });
});