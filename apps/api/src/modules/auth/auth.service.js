const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../../config/database');
const jwtConfig = require('../../config/jwt');

class AuthService {
  async login(schema, tenantId, email, password) {
    const user = await db('users').withSchema(schema).where({ email, is_active: true }).first();

    if (!user) throw { status: 401, message: 'Email yoki parol noto\'g\'ri' };

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw { status: 401, message: 'Email yoki parol noto\'g\'ri' };

    const accessToken = this._generateAccessToken(user, schema, tenantId);
    const refreshToken = this._generateRefreshToken(user, schema, tenantId);

    // Refresh tokenni saqlash
    await db('refresh_tokens').withSchema(schema).insert({
      id: uuidv4(),
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await db('users').withSchema(schema).where({ id: user.id }).update({ last_login: new Date() });

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async refresh(schema, tenantId, refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
      const stored = await db('refresh_tokens')
        .withSchema(schema)
        .where({ token: refreshToken, user_id: decoded.userId })
        .where('expires_at', '>', new Date())
        .first();

      if (!stored) throw { status: 401, message: 'Token yaroqsiz' };

      const user = await db('users').withSchema(schema).where({ id: decoded.userId, is_active: true }).first();
      if (!user) throw { status: 401, message: 'Foydalanuvchi topilmadi' };

      const accessToken = this._generateAccessToken(user, schema, tenantId);
      return { accessToken };
    } catch (err) {
      throw { status: 401, message: 'Token yaroqsiz yoki muddati tugagan' };
    }
  }

  async logout(schema, userId, refreshToken) {
    await db('refresh_tokens').withSchema(schema).where({ user_id: userId, token: refreshToken }).delete();
    return true;
  }

  async changePassword(schema, userId, currentPassword, newPassword) {
    const user = await db('users').withSchema(schema).where({ id: userId }).first();
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) throw { status: 400, message: 'Joriy parol noto\'g\'ri' };

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db('users').withSchema(schema).where({ id: userId }).update({ password_hash: hashedPassword });
    return true;
  }

  _generateAccessToken(user, schema, tenantId) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role, schema, tenantId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
  }

  _generateRefreshToken(user, schema, tenantId) {
    return jwt.sign(
      { userId: user.id, schema, tenantId },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn }
    );
  }
}

module.exports = new AuthService();
