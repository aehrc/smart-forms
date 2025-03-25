import Image from 'next/image';
import Link from 'next/link';
import ProductCard from './components/ProductCard';
import AllergyIntolleranceForm from './allergy-intolerance-form/AllergyIntoleranceForm';
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <AllergyIntolleranceForm />
    </div>
    // <main>
    //   <h1>Hello World!</h1>
    //   {/* client side navigation */}
    //   <Link href="/users">Users</Link>
    //   <ProductCard></ProductCard>
    // </main>
  );
}
