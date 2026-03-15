import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../src/components/ui/Modal';

describe('Modal', () => {
  test('renders children when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Test Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Test Content</div>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  test('calls onClose on backdrop click', () => {
    const onClose = jest.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        Test
      </Modal>
    );
    // The backdrop is the absolute -z-10 div inside the modal container
    const backdrop = container.querySelector('.absolute.inset-0.-z-10');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose on content click', () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div data-testid="content">Test</div>
      </Modal>
    );
    fireEvent.click(screen.getByTestId('content'));
    expect(onClose).not.toHaveBeenCalled();
  });
});

