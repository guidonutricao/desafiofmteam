import { render, screen } from '@testing-library/react';
import { FieldIndicator, RequiredAsterisk } from '../FieldIndicator';

describe('FieldIndicator', () => {
  it('shows error state', () => {
    render(<FieldIndicator error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toHaveClass('text-red-400');
  });

  it('shows success state', () => {
    render(<FieldIndicator success={true} />);
    
    expect(screen.getByText('Campo válido')).toBeInTheDocument();
    expect(screen.getByText('Campo válido')).toHaveClass('text-green-400');
  });

  it('shows required state', () => {
    render(<FieldIndicator required={true} />);
    
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Campo obrigatório')).toHaveClass('text-amber-400');
  });

  it('renders nothing when no state is active', () => {
    const { container } = render(<FieldIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('prioritizes error over other states', () => {
    render(<FieldIndicator error="Error message" success={true} required={true} />);
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Campo válido')).not.toBeInTheDocument();
    expect(screen.queryByText('Campo obrigatório')).not.toBeInTheDocument();
  });
});

describe('RequiredAsterisk', () => {
  it('renders asterisk with correct styling', () => {
    render(<RequiredAsterisk />);
    
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-400', 'ml-1');
    expect(asterisk).toHaveAttribute('aria-label', 'Campo obrigatório');
  });
});