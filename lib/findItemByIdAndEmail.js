const {ObjectId} = require("mongodb");

const findItemByIdAndEmail = async (db, itemId, email) => {
    const collections = ['lost_items', 'found_items'];

    for (const collectionName of collections) {
        const collection = db.collection(collectionName);
        const item = await collection.findOne({
            _id: new ObjectId(itemId),
            email: email
        });

        if (item) {
            return {item, collection};
        }
    }

    return null;
};

module.exports = findItemByIdAndEmail;
