const pgPool = require('../config/connection.js');
const bcrypt = require('bcrypt');

const sql = {
  createUser: 'INSERT INTO users (uname, pw, email) VALUES ($1, $2, $3) RETURNING id_users',
  checkEmail: 'SELECT * FROM users WHERE email = $1',
  getPassword: 'SELECT pw, id_users FROM users WHERE uname = $1',
  getUserInfo: 'SELECT lname, fname, uname, email FROM users WHERE id_users = $1',
  deleteUser: 'DELETE FROM users WHERE id_users = $1 RETURNING uname',
  updateUser: 'UPDATE users SET fname = $1, lname = $2 WHERE id_users = $3 RETURNING uname, fname, lname'
};

const isEmailInUse = async (email) => {
  const result = await pgPool.query(sql.checkEmail, [email]);
  return result.rows.length > 0;
};

const createUser = async (userData) => {
  const { uname, pw, email } = userData;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(pw, saltRounds);
  const values = [uname, passwordHash, email];
  try {
    const result = await pgPool.query(sql.createUser, values);
    return result.rows[0];
  } catch (error) {
    console.log('Error in createUser', error);
    throw new Error('Error in createUser');
  }
};

const getPasswordAndId = async (uname) => {
  const result = await pgPool.query(sql.getPassword, [uname]);
  if (result.rows.length > 0) {
    return result.rows;
  } else {
    return null;
  }
};

const updateUser = async (userData, userId) => {
  const { fname, lname } = userData;
  const values = [fname, lname, userId];
  try {
    const result = await pgPool.query(sql.updateUser, values);
    if (result.rows.length < 0) {
      return null;
    }
    return result.rows[0];
  } catch (error) {
    console.log('Error in updateUser', error);
    throw new Error('Error in updateUser');
  }
};

const getUserInfo = async (userId) => {
  try {
    const result = await pgPool.query(sql.getUserInfo, [userId]);

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error in getUserInfo', error);
    throw new Error('Error in getUserInfo');
  }
};

const deleteUser = async (userId) => {
  try {
    const result = await pgPool.query(sql.deleteUser, [userId]);
    if (result.rows.length > 0) {
      return result.rows[0].uname;
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error in deleteUser', error);
    throw new Error('Error in deleteUser');
  }
};

module.exports = {
  createUser,
  isEmailInUse,
  getPasswordAndId,
  getUserInfo,
  updateUser,
  deleteUser
};
