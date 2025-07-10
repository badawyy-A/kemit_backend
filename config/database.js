const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI); // لا حاجة إلى الخيارات
    console.log(`Database Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Database Error: ${err.message}`);
    process.exit(1); // إنهاء التطبيق في حالة حدوث خطأ في الاتصال
  }
};

module.exports = dbConnection;
