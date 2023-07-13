const responseStatus = (status, data, type) => {
  const errorType = type === "error";
  const successType = type === "success";

  return (res) =>
    res
      .status(status)
      .send(
        errorType ? { error: data } : successType ? { success: data } : data
      );
};

module.exports = responseStatus;
