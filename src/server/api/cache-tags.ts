const cacheTags = {
  applications: {
    list: (userId: string) => `applications-list:${userId}`,
    metadata: (applicationId: string) => `metaData:${applicationId}`,
  },
  config: (userId: string) => `config:${userId}`,
};

export default cacheTags;
