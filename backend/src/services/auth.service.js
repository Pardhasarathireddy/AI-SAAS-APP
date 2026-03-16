import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository.js';

class AuthService {
  async register(userData) {
    const { firstName, lastName, email, password } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password with salt and SECRET_KEY (pepper)
    const saltRounds = 10;
    const pepper = process.env.SECRET_KEY;
    const passwordWithPepper = password + pepper;
    const hashedPassword = await bcrypt.hash(passwordWithPepper, saltRounds);

    // Create user
    const newUser = await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return userResponse;
  }

  async login(email, password) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password with pepper
    const pepper = process.env.SECRET_KEY;
    const passwordWithPepper = password + pepper;
    const isPasswordValid = await bcrypt.compare(passwordWithPepper, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Return user (without password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      token,
    };
  }

  async updateProfile(userId, updateData) {
    const { firstName, lastName, email } = updateData;

    // If email is being changed, check if it's already taken
    if (email) {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error('Email already in use');
      }
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return userResponse;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const pepper = process.env.SECRET_KEY;
    const isPasswordValid = await bcrypt.compare(currentPassword + pepper, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid current password');
    }

    // Hash and save new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword + pepper, saltRounds);
    user.password = hashedPassword;

    await user.save();
    return { message: 'Password updated successfully' };
  }
}

export default new AuthService();
