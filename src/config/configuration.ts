export default () => ({
  database: process.env.DATABASE_URL,
  redis: process.env.REDIS_URL,
});
