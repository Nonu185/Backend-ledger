const mongoose = require('mongoose');
const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Account',
        required:[true,"Ledger must be associated with an account"],
        index:true,
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Transaction',
        required:[true,"Ledger must be associated with a transaction"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a ledger entry"],
        immutable:true,
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"Type can be either CREDIT or DEBIT"
        },
        required:[true,"Ledger type is required"],
        immutable:true
    }
},{
    timestamps:true
})

function preventLedgerMutation(next) {
  next(
    new Error("Ledger entries are immutable and cannot be updated or deleted"),
  );
}

ledgerSchema.pre("updateOne", preventLedgerMutation);
ledgerSchema.pre("findOneAndUpdate", preventLedgerMutation);
ledgerSchema.pre("deleteOne", preventLedgerMutation);
ledgerSchema.pre("findOneAndDelete", preventLedgerMutation);
ledgerSchema.pre("deleteMany", preventLedgerMutation);



const ledgermodel = mongoose.model("Ledger",ledgerSchema)

module.exports = ledgermodel