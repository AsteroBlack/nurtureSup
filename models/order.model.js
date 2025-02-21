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
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            plat: {
                type: DataTypes.STRING,
                allowNull: false
            },
            entree: {
                type: DataTypes.STRING,
                allowNull: true
            },
            dessert: {
                type: DataTypes.STRING,
                allowNull: true
            }
        }, {
        timestamps: true
    })
    return Order
}

