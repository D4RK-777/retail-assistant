import React from 'react';
import { Layout } from '@/components/Layout';
import { ContentManager } from '@/components/ContentManager';

export default function KnowledgeBase() {
  return (
    <Layout activeTab="knowledge" onTabChange={() => {}}>
      <ContentManager />
    </Layout>
  );
}