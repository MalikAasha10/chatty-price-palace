const sellerSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
  });
  
  module.exports = mongoose.model('Seller', sellerSchema);