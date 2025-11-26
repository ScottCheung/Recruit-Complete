/** @format */
import { ContactForm } from './contactForm/ContactForm';
import { DEFAULT_CONFIG } from './contactForm/config';

const contactPoints = [
  'Discovery sessions to uncover optimisation opportunities',
  'Scenario modelling, proof-of-concept builds and rapid prototyping',
  'Full-scale delivery, integration and ongoing optimisation support',
];

export default function ContactSection() {
  return (


    <ContactForm
      config={DEFAULT_CONFIG}
      className='mt-12'
      title='Book a Call'
      description="Have questions? We'd love to hear from you."
      variant='default'
      showAnimation={true}
    />

  );
}
