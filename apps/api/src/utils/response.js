const success = (res, data, message = 'Muvaffaqiyatli', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const paginated = (res, data, pagination, message = 'Muvaffaqiyatli') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

const error = (res, message = 'Xatolik yuz berdi', statusCode = 400, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { success, paginated, error };
