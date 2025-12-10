// Redirect to home since policy pages need proper directory structure
import { redirect } from 'next/navigation';

export default function PrivacyPolicyFallback() {
  redirect('/');
}
