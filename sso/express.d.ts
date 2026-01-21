declare namespace Express {
  interface Request {
    session: {
      username?: string;
    };
  }
}
