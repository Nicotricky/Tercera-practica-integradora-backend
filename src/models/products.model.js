import mongoose from "mongoose"
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
import mongoosePaginate from 'mongoose-paginate-v2'

mongoose.pluralize(null)

const collection = "products"

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    thumbnail: {
        type: String,
        required: false,
    },
    code: {
        type: String,
        unique: true, 
        required: true
    },
    category: {
        type: String,
        required: true,
        //enum: [ "remeras", "pantalones", "vestidos", "faldas", "abrigos", "sweaters" ],
        //default: '',
        // index: true
    },
    status: {
        type: Boolean,
        default: true 
    }, 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        default: 'admin',
        ref: 'users',
        default: null
    }
})

schema.plugin(mongoosePaginate)
schema.plugin(mongooseAggregatePaginate)

const model = mongoose.model(collection, schema)
export default model