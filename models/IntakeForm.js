const mongoose = require("mongoose");

const IntakeFormSchema = new mongoose.Schema({
  // Office Information
  yourName: {
    type: String,
    required: [true, "Your name is required"],
  },
  office: {
    type: String,
    enum: ["Santa Maria", "Bakersfield", "Riverside", "San Bernardino"],
    default: "Santa Maria",
  },
  dateSubmitted: {
    type: Date,
    default: Date.now,
  },
  transactionDate: {
    type: Date,
    required: [true, "Transaction date is required"],
  },
  typeOfTransaction: {
    type: String,
    enum: [
      "Intake",
      "In House Move",
      "Termination",
      "Shelter Placement",
      "LOC Change",
    ],
    required: [true, "Type of transaction is required"],
  },

  // Case Assigned To
  pathwayRepresentative: {
    type: String,
  },
  positionJobTitle: {
    type: String,
    default: "Social Worker",
  },
  intakeRepresentative: {
    type: String,
  },
  officeNumber: {
    type: String,
    default: "201",
  },
  phoneNumber: {
    type: String,
    default: "(805) 739-1111",
  },

  // Client Information
  caseNumber: {
    type: String,
    required: [true, "Case number is required"],
  },
  name: {
    type: String,
    required: [true, "Client name is required"],
  },
  age: {
    type: Number,
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"],
  },
  ethnicity: {
    type: String,
    enum: [
      "African American",
      "Asian/Pacific Island",
      "Latino",
      "Native American",
      "White",
      "Other",
      "Unknown",
    ],
    default: "Unknown",
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: [true, "Gender is required"],
  },
  clientStatus: {
    // RENAMED from status to clientStatus
    type: Number,
    enum: [300, 601, 602],
    default: 300,
  },
  priorPlacement: {
    type: String,
    enum: [
      "Natural Parent",
      "County Facility",
      "County Foster Home",
      "County Hospital",
      "Foster Care Agency",
      "Friend of Family",
      "Group Home",
      "Jamison Center",
      "Legal Guardianship",
      "Natural Parent",
      "Relative",
      "Unknown",
    ],
  },
  reasonForPlacement: {
    type: String,
    enum: [
      "Abandoned",
      "Domestic Violence",
      "Drug Baby",
      "Mental Abuse",
      "Neglect",
      "No Care Taker",
      "Other",
      "Physical Abuse",
      "Probation",
      "In House Move",
      "Sexual Abuse to Sibling",
      "Sexual Abuse",
      "Unknown",
      "Voluntary",
    ],
    required: [true, "Reason for placement is required"],
  },
  levelOfCare: {
    type: String,
    enum: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
    required: [true, "Level of care is required"],
  },

  // Mother/Baby Information - ADDED
  infantFullName: {
    type: String,
  },
  infantDateOfBirth: {
    type: Date,
  },
  infantAge: {
    type: Number,
  },
  infantIntakeDate: {
    type: Date,
  },
  infantGender: {
    type: String,
    enum: ["Male", "Female"],
  },
  infantEthnicity: {
    type: String,
    enum: [
      "African American",
      "Asian/Pacific Island",
      "Latino",
      "Native American",
      "White",
      "Other",
      "Unknown",
    ],
  },

  // Foster Home Information - ADDED
  fosterParentsPayment: {
    type: String,
  },
  nameOfFosterParents: {
    type: String,
  },
  fosterParentsTelephone: {
    type: String,
  },
  fosterParentsAddress: {
    type: String,
  },
  fosterParentsMailingAddress: {
    type: String,
  },
  fosterParentsCity: {
    type: String,
  },
  fosterParentsState: {
    type: String,
    default: "California",
  },
  fosterParentsZip: {
    type: String,
  },

  // County Worker Information - ADDED
  countyWillPay: {
    type: String,
  },
  countyWorkerName: {
    type: String,
  },
  countyWorkerTitle: {
    type: String,
    default: "CSW",
  },
  nameOfCounty: {
    type: String,
    default: "Santa Barbara",
  },
  nameOfDepartment: {
    type: String,
    default: "DHS",
  },
  countyWorkerTelephone: {
    type: String,
  },
  countyWorkerAddress: {
    type: String,
  },
  countyWorkerCity: {
    type: String,
  },
  countyWorkerState: {
    type: String,
    default: "CA",
  },
  countyWorkerZip: {
    type: String,
  },

  // Signatures and Metadata
  signatures: {
    type: Map,
    of: String,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["In Progress", "Completed", "Pending", "Needs Review", "Archived"],
    default: "In Progress",
  },
  archived: {
    type: Boolean,
    default: false,
  },
  lastStatusUpdate: {
    type: Date,
    default: Date.now,
  },

  // Document categories
  categories: [
    {
      type: String,
      enum: ["Intake Paperwork", "Shelter Bed Documents", "In House Move"],
    },
  ],
});

module.exports = mongoose.model("IntakeForm", IntakeFormSchema);
