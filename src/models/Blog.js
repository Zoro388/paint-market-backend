import mongoose from "mongoose";

const blogSchema =
new mongoose.Schema(

{

    /*
    |--------------------------------------------------------------------------
    | BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    title: {

        type: String,

        required: true,

        trim: true,

    },

    slug: {

        type: String,

        required: true,

        unique: true,

        trim: true,

    },

    /*
    |--------------------------------------------------------------------------
    | BLOG CONTENT
    |--------------------------------------------------------------------------
    */

    content: {

        type: String,

        required: true,

    },

    excerpt: {

        type: String,

        required: true,

        trim: true,

    },

    featuredImage: {

        type: String,

        required: true,

    },

    /*
    |--------------------------------------------------------------------------
    | AUTHOR
    |--------------------------------------------------------------------------
    */

    author: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

    },

    /*
    |--------------------------------------------------------------------------
    | TAGS
    |--------------------------------------------------------------------------
    */

    tags: [

        {

            type: String,

            trim: true,

        },

    ],

    /*
    |--------------------------------------------------------------------------
    | SEO
    |--------------------------------------------------------------------------
    */

    metaTitle: {

        type: String,

        default: "",

        trim: true,

    },

    metaDescription: {

        type: String,

        default: "",

        trim: true,

    },

    canonicalUrl: {

        type: String,

        default: "",

        trim: true,

    },

    /*
    |--------------------------------------------------------------------------
    | BLOG STATISTICS
    |--------------------------------------------------------------------------
    */

    readingTime: {

        type: Number,

        default: 1,

        min: 1,

    },

    views: {

        type: Number,

        default: 0,

    },

    /*
    |--------------------------------------------------------------------------
    | DISPLAY OPTIONS
    |--------------------------------------------------------------------------
    */

    isFeatured: {

        type: Boolean,

        default: false,

    },

    status: {

        type: String,

        enum: [

            "draft",

            "published",

        ],

        default: "published",

    },

},

{

    timestamps: true,

}

);

const Blog =
mongoose.model(

    "Blog",

    blogSchema

);

export default Blog;