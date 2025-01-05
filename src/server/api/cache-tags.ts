const cacheTags = {
  applications: {
    list: (userId: string) => `applications-list:${userId}`,
    metadata: (applicationId: string) => `metaData:${applicationId}`,
  },
};

export default cacheTags;
