import React from 'react';
import { Layout } from '@/components/Layout';
import { AITraining } from '@/components/AITraining';

export default function AITrainingPage() {
  return (
    <Layout activeTab="training" onTabChange={() => {}}>
      <AITraining />
    </Layout>
  );
}