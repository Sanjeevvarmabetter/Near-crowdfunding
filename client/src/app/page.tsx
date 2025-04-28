// app/page.tsx (or src/app/page.tsx depending on Next.js version)
'use client';

import { useState, useEffect } from 'react';
import Create from './components/Create';
import CardList from './components/CardList';
import { Navbar } from './components/Navbar';

// Define Campaign data type
type Campaign = {
  id: string;
  title: string;
  description: string;
  image: string;
  target: string;
  amount_collected: string;
  deadline: number;
  status: string;
};

export default function HomePage() {
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);

  // Example dummy upload and fund function (replace with actual logic)
  const uploadToPinata = async (file: File): Promise<string> => {
    console.log('Uploading to Pinata:', file);
    return 'https://ipfs.io/ipfs/your-ipfs-hash';
  };

  const createFund = async (
    imageIpfsHash: string,
    title: string,
    description: string,
    targetAmount: string,
    deadline: number
  ) => {
    console.log('Creating fund:', { imageIpfsHash, title, description, targetAmount, deadline });
    // Logic to add the campaign locally
    const newCampaign: Campaign = {
      id: (Math.random() * 100000).toFixed(0),
      title,
      description,
      image: imageIpfsHash,
      target: targetAmount,
      amount_collected: '0',
      deadline,
      status: 'open',
    };
    setAllCampaigns((prev) => [...prev, newCampaign]);
  };

  const fundCampaign = (id: string, amount: string) => {
    console.log(`Funding campaign ${id} with amount ${amount}`);
    setAllCampaigns((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign.id === id
          ? {
              ...campaign,
              amount_collected: (parseFloat(campaign.amount_collected) + parseFloat(amount)).toString(),
            }
          : campaign
      )
    );
  };

  const handleRouteChange = (route: string) => {
    console.log(`Routing to: ${route}`);
    // Implement route change logic if needed.
  };

  return (
    <main className="bg-black min-h-screen flex flex-col items-center">
      <Navbar onRouteChange={handleRouteChange} />
      <div className="pt-24 w-full flex flex-col items-center">
        <Create uploadToPinata={uploadToPinata} createFund={createFund} />
        <div className="mt-10 w-full flex justify-center">
          <CardList allCampaigns={allCampaigns} fundCampaign={fundCampaign} />
        </div>
      </div>
    </main>
  );
}
