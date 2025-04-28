import React from "react";
import Card from "./Card";
import styles from '@/styles/app.module.css';

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  target: string;
  amount_collected: string;
  deadline: number;
  status: string;
}

interface CardListProps {
  allCampaigns: Campaign[];
  fundCampaign: (id: string, amount: string) => void;
}

const CardList: React.FC<CardListProps> = ({ allCampaigns, fundCampaign }) => {
  return (
    <div>
      {allCampaigns.length === 0 ? (
        <p>No Campaigns found.</p>
      ) : (
        <div className='flex flex-wrap gap-10 justify-center pb-5'>
          {allCampaigns.map((data) => (
            <Card
              key={data.id}
              id={data.id}
              title={data.title}
              description={data.description}
              image={data.image}
              targetAmount={data.target}
              amount_collected={data.amount_collected}
              deadline={data.deadline}
              status={data.status}
              fundCampaign={fundCampaign}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardList;
