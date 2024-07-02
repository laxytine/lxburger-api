// [SECTION] Dependencies and modules
const User = require("../models/User.js");
const { errorHandler } = require("../auth.js");
const bcrypt = require("bcrypt");
const auth = require("../auth.js");

const Product = require("../models/Product.js");
const Order = require("../models/Order.js");
const Cart = require("../models/Cart.js");

const { generateOTP, mailTransport } = require("../mail.js");
const VerificationToken = require("../models/VerificationToken.js");

// [SECTION] User Registration
module.exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNo, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send({ error: "User with this email already exists" });
    }
    if (!/^[a-zA-Z\s]+$/.test(firstName) || !/^[a-zA-Z\s]+$/.test(lastName)) {
      return res.status(400).send({
        error: "First and last name must contain only letters and spaces",
      });
    } else if (!firstName.trim() || !lastName.trim()) {
      return res
        .status(400)
        .send({ error: "First and last name must not be empty" });
    } else if (!email.includes("@")) {
      return res.status(400).send({ error: "Invalid email format" });
    } else if (password.length < 8) {
      return res
        .status(400)
        .send({ error: "Password must be at least 8 characters long" });
    } else if (mobileNo.length !== 11) {
      return res.status(400).send({ error: "Mobile number is invalid" });
    }

    let newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      password: bcrypt.hashSync(req.body.password, 10),
    });

    const OTP = generateOTP();
    const verificationToken = new VerificationToken({
      owner: newUser._id,
      token: OTP,
    });
    await verificationToken.save();

    mailTransport().sendMail({
      from: "L&X Burger <L&X_Burger@gmail.com>",
      to: newUser.email,
      subject: "Your One-Time Password (OTP) for Verification",
      html: `
              <p>Your one-time password (OTP) for completing your verification is:</p>
              <h1>${OTP}</h1>
              <p>Please use this code to complete your verification process.</p>
              <p>Note Note that this OTP is valid for 10 minutes from the time of this email.</p>
              <p>For security reasons, do not share this OTP with anyone.</p>
              <p?Thank you!</p>
            `,
    });

    const result = await newUser.save();
    return res.status(201).send({
      message: "User registered successfully",
      user: result,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// [SECTION] User Authentication
module.exports.loginUser = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !email.includes("@")) {
    return res.status(400).send({ error: "Invalid email format" });
  }

  if (!password) {
    return res.status(400).send({ error: "Password is required" });
  }

  User.findOne({ email: email })
    .then((result) => {
      if (!result) {
        return res.status(404).send({ error: "Email is not registered" });
      }

      console.log("Plain text password:", password);
      console.log("Hashed password from DB:", result.password);

      if (!result.password) {
        return res
          .status(500)
          .send({ error: "User password is not set in the database" });
      }

      const isPasswordCorrect = bcrypt.compareSync(password, result.password);

      if (isPasswordCorrect) {
        return res.status(200).send({
          message: "User logged in successfully",
          access: auth.createAccessToken(result),
          user: {
            email: result.email,
            isVerified: result.isVerified,
            id: result._id,
            isAdmin: result.isAdmin,
          },
        });
      } else {
        return res.status(401).send({ error: "Incorrect email or password" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

//[SECTION] Retrieve User Details
module.exports.getDetails = (req, res) => {
  return User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      user.password = "";
      return res.status(200).send(user);
    })
    .catch((error) => errorHandler(error, req, res));
};

// [SECTION] Update User as Admin
module.exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "User ID is required" });
  }

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if user is already an admin
    if (user.isAdmin) {
      return res.status(400).send({ message: "User is already an admin" });
    }

    // Update isAdmin property to true
    user.isAdmin = true;
    await user.save(); // Save the updated user

    return res.send({ updatedUser: user });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Internal server error" });
  }
};

// [SECTION] Update Password
module.exports.updatePassword = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user);

    const { newPassword } = req.body;
    const { id } = req.user;

    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .send({ message: "Password must be at least 8 characters long" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    return res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

// [SECTION] Verify Email
module.exports.verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const verificationTokens = await VerificationToken.find();
    let verificationToken = null;

    for (let vt of verificationTokens) {
      const isValidToken = await vt.compareToken(token);
      if (isValidToken) {
        verificationToken = vt;
        break;
      }
    }

    if (!verificationToken) {
      return res
        .status(400)
        .send({ message: "Invalid or expired verification token" });
    }

    const user = await User.findById(verificationToken.owner);
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    mailTransport().sendMail(
      {
        from: "L&X Burger <L&X_Burger@gmail.com>",
        to: user.email,
        subject: "Email Verification Successful!",
        html: `
                <h1>We are pleased to inform you that your email address has been successfully verified!</h1>
                <p>Thank you for taking the time to complete this important step. You can now enjoy full access to all the features and benefits that our service offers.</p>
                <ul>
                    <li><strong>Explore:</strong> Discover new features and tools tailored to enhance your experience.</li>
                    <li><strong>Stay Updated:</strong> Receive important updates, news, and exclusive offers.</li>
                    <li><strong>Get Support:</strong> Access our customer support for any help you might need.</li>
                </ul>
                <p>If you have any questions or need assistance, feel free to reach out to us.</p>
            `,
      },
      (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
        } else {
          console.log("Email sent:", info.response);
        }
      }
    );

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    return res.status(200).send({
      message: "Email verified successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// [SECTION] Resend Verification code
module.exports.resendVerificationCode = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .send({ message: "This email is already verified" });
    }

    // Generate a new OTP
    const OTP = generateOTP();

    // Remove any existing verification tokens for the user
    await VerificationToken.deleteMany({ owner: user._id });

    // Save the new verification token
    const verificationToken = new VerificationToken({
      owner: user._id,
      token: OTP,
    });
    await verificationToken.save();

    // Send the verification email
    mailTransport().sendMail(
      {
        from: "L&X Burger <L&X_Burger@gmail.com>",
        to: user.email,
        subject: "Resend Email Verification Code",
        html: `<h1>${OTP}</h1> \nis your authentication code. For your protection, do not share this code with anyone.`,
      },
      (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
        } else {
          console.log("Email sent:", info.response);
        }
      }
    );

    return res
      .status(200)
      .send({ message: "Verification email resent successfully" });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.getAllDetails = (req, res) => {
  return User.find({})
    .then((users) => {
      if (!users || users.length === 0) {
        return res.status(404).send({ message: "No users found" });
      }

      return res.status(200).send(users);
    })
    .catch((error) => errorHandler(error, req, res));
};

// [SECTION] Retrieve All Users
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
