import User from "../models/user";

export async function addWishlist(req, res) {

    try {

        const userId = req.user._id

        const productId = req.body.productId

        const user = await User.findById(userId)

        const exists = user.wishlist.includes(productId)

        if (exists) {

            return res.status(400).json({

                message: "Already Added"

            })

        }

        user.wishlist.push(productId)

        await user.save()

        res.json({

            message: "Added Successfully"

        })
    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })
    }

}

export async function removeWishlist(req, res) {

    try {

        const userId = req.user._id

        const productId = req.params.id

        const user = await User.findById(userId)

        user.wishlist = user.wishlist.filter(

            item => item.toString() !== productId

        )

        await user.save()

        res.json({

            message: "Removed"

        })

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}

export async function getWishlist(req, res) {

    try {

        const user = await User.findById(

            req.user._id

        ).populate("wishlist")

        if (!user) {

            return res.status(404).json({

                message: "User not found"

            })

        }

        res.status(200).json(

            user.wishlist

        )

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}