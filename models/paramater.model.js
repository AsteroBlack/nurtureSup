module.exports = (sequelize, DataTypes) => {
    const Parameters = sequelize.define(
    'Parameter', {
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true
    })

    return Parameters
}
