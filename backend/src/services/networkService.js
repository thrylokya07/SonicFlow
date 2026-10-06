const NETWORK_PROFILES = {
  excellent: {
    label: "Excellent",
    delay: 0,
    throughput: 2500
  },

  good: {
    label: "Good",
    delay: 80,
    throughput: 1200
  },

  slow: {
    label: "Slow",
    delay: 300,
    throughput: 350
  },

  verySlow: {
    label: "Very Slow",
    delay: 700,
    throughput: 120
  }
};

function getNetworkProfile(network = "excellent") {
  return NETWORK_PROFILES[network] || NETWORK_PROFILES.excellent;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  NETWORK_PROFILES,
  getNetworkProfile,
  delay
};