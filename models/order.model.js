module.exports = (sequelize, DataTypes) => {

    const Order = sequelize.define(
        "Order",
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            menuId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            jour: {
                type: DataTypes.STRING,
                allowNull: false
            },
            plat: {
                type: DataTypes.STRING,
                allowNull: false
            },
            entreeDessert: {
                type: DataTypes.STRING,
                allowNull: true
            },
        }, {
        timestamps: true
    })
    return Order
}

