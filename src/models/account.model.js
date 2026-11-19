const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status can be ACTIVE | FROZEN | CLOSED",
      },
      default: "ACTIVE",
    },
    currency: {
      type: String,
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
  const Ledger = mongoose.model("Ledger");

  const balanceData = await Ledger.aggregate([
    {
      $match: { account: this._id },
    },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);



  return balanceData[0]?.total || 0;
};

const accountModel = mongoose.model("Account", accountSchema);

module.exports = accountModel;
