// Studio connector: the single place that talks to the studio's booking system.
// Replace `enroll` with a real call once we know which studio app/API is used.
const StudioConnector = {
  async enroll(plan) {
    await new Promise(r => setTimeout(r, 600));
    // Mock: always succeeds. Throw an Error to mark the enrollment as failed.
    return { confirmation: 'MOCK-' + plan.id.slice(0, 6).toUpperCase() };
  },
};
