import Hero from "../../Components/Hero";
import Trending from "../../Components/Trending";
import ShoppingExperience from "../../Components/ShoppingExperience";
import Testmonial from "../../Components/Testmonial";
import SubscribeSection from "../../Components/SubscribeSection";
import CommentSection from "../../Components/CommentSection";

export default async function HomePage() {
  // This delay triggers loading.tsx
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return (
    <>
      <Hero />
      <Trending />
      <ShoppingExperience />
      <Testmonial />
      <SubscribeSection />
      <CommentSection />
    </>
  );
}

