import { Metadata } from "next";
import { CollectionView } from "@/components/store/CollectionView";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // REST API is more stable on the server than the Client SDK
  return {
    title: `${slug.toUpperCase()} Collection`,
    description: `Explore the ${slug} collection at KhushKhush. Exclusive streetwear drops and limited editions.`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  return <CollectionView slug={slug} />;
}
