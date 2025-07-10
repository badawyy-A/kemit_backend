exports.sanitizeUser = function (user) {
  return {
    _id: user._id,
    userName: user.userName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    profileImg: user.profileImg,
    createReport: user.createReport,
  };
};

exports.sanitizeUsers = function (users) {
  return users.map((user) => ({
    _id: user._id,
    userName: user.userName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    profileImg: user.profileImg,
    createReport: user.createReport,
  }));
};
