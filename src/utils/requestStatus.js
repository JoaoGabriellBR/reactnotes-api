const requestStatus = (status, data, error) => {
  return (res) => res.status(status).send(error ? { error: data } : data);
};

module.exports = requestStatus;
