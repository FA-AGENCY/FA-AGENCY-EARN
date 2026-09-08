// Mock Telegram WebApp for local browser testing
if (!window.Telegram?.WebApp?.initData) {
  window.Telegram = {
    WebApp: {
      initData: "query_id=AAEC4VdrCz&user=%7B%22id%22%3A980047040%2C%22first_name%22%3A%22Developer%22%2C%22username%22%3A%22dev_user%22%7D&auth_date=1710000000&hash=mock_hash",
      initDataUnsafe: {
        user: {
          id: 980047040,
          first_name: "Developer",
          username: "dev_user"
        }
      },
      ready: () => {},
      expand: () => {},
      close: () => {}
    }
  };
}
