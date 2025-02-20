module.exports = (sequelize, DataTypes, useBcrypt) => {
    const userModel = sequelize.define(
        'user',
        {   
            name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "name field must not be empty"
                },
            }
          },
            number: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isNumeric: {
                        args: true,
                        msg: 'number must be numeric value'
                    }
                }
            },

            role: {
                type: DataTypes.ENUM('user', 'admin'),
                defaultValue: 'user'
            },

            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: {
                        args: true,
                        msg: "passwort field must not be empty"
                    },
                    len: {
                        args: [8, Infinity],
                        msg: "the password must be at least 8 characters long"
                    }
                }
            },

            passwordResetToken: {
                type: DataTypes.STRING,
                allowNull: true
            },
            passwordResetExpires: {
                type: DataTypes.DATE,
                allowNull: true
            }
        }
    )
    useBcrypt(userModel, {
        field: 'password', // secret field to hash, default: 'password'
        rounds: 12, // used to generate bcrypt salt, default: 12
        compare: 'authenticate', // method used to compare secrets, default: 'authenticate'
    })
    return userModel
}