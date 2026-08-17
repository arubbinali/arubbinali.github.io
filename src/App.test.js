import { render } from '@testing-library/react';
import IntroAnimation from './components/intro';

test('renders the doaor intro', () => {
  const { container } = render(<IntroAnimation />);
  expect(container.querySelector('.intro-container')).toBeInTheDocument();
});
