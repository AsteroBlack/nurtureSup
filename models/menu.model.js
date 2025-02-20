module.exports = (sequelize, DataTypes, useBcrypt) => {

    const MenuModel = sequelize.define(
        'Menu',
        {
            week: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            menuData: {
                type: DataTypes.JSON,
                allowNull: false
            }
        }, {
        timestamps: true
    })

    return MenuModel
}

