const cacheTags = {
  applications: {
    list: (userId: string) => `applications-list:${userId}`,
    details: (applicationId: string) => `applications-details:${applicationId}`,
    metadata: (applicationId: string) => `metaData:${applicationId}`,
  },
};

export default cacheTags;
