import User from "../models/user.js"

export async function addToCart(req, res) {

    try {

        const user = await User.findById(

            req.user._id

        )

        const productId = req.body.productId

        const item = user.cart.find(

            item => item.product.toString() === productId

        )

        if (item) {

            item.quantity++

        }

        else {

            user.cart.push({

                product: productId,

                quantity: 1

            })

        }

        await user.save()

        res.json({

            message: "Added"

        })

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}

export async function removeCartItem(req, res) {

    try {

        const user = await User.findById(req.user._id)

        const productId = req.params.productId


        user.cart = user.cart.filter(

            item => item.product.toString() !== productId

        )


        await user.save()


        res.json({

            message: "Product Removed"

        })


    }
    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}

export async function increaseQuantity(req, res) {

    try {


        const user = await User.findById(

            req.user._id

        )


        const productId = req.params.productId



        const item = user.cart.find(

            item => item.product.toString() === productId

        )



        if (!item) {

            return res.status(404).json({

                message: "Item not found"

            })

        }


        item.quantity++


        await user.save()


        res.json({

            message: "Quantity Updated"

        })



    }


    catch (err) {


        res.status(500).json({

            message: err.message

        })


    }



}

export async function decreaseQuantity(req, res) {

    try {


        const user = await User.findById(

            req.user._id

        )


        const productId = req.params.productId


        const item = user.cart.find(

            item => item.product.toString() === productId

        )



        if (!item) {

            return res.status(404).json({

                message: "Not Found"

            })

        }



        item.quantity--



        if (item.quantity <= 0) {


            user.cart = user.cart.filter(

                cartItem => cartItem.product.toString() !== productId

            )


        }



        await user.save()



        res.json({

            message: "Quantity Updated"

        })



    }


    catch (err) {


        res.status(500).json({

            message: err.message

        })


    }


}

export async function getCart(req, res) {

    try {


        const user = await User.findById(

            req.user._id

        )

            .populate(

                "cart.product"

            )



        res.json(

            user.cart

        )



    }

    catch (err) {


        res.status(500).json({

            message: err.message

        })


    }


}

export async function getCartSummary(req, res) {

    try {

        const user = await User.findById(

            req.user._id

        )

            .populate("cart.product")

        let subtotal = 0

        user.cart.forEach(item => {

            subtotal +=

                item.product.price * item.quantity

        })

        let shipping = 0

        if (subtotal < 10000) {

            shipping = 300

        }

        let tax = subtotal * 0.15

        let total = subtotal + shipping + tax

        res.json({

            subtotal,shipping,tax,total

        })

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}

export async function getCartSummary(req, res) {

    try {

        const coupon = req.query.coupon

        const user = await User.findById(

            req.user._id

        ).populate("cart.product")


        let subtotal = 0

        user.cart.forEach(item => {

            subtotal += item.product.price * item.quantity

        })

        // Shipping Fee

        let shipping = 0

        if (subtotal < 10000) {

            shipping = 300

        }

        // Coupon

        let discount = 0

        if (coupon === "SAVE10") {

            discount = subtotal * 0.10

        }

        else if (coupon === "SAVE20") {

            discount = subtotal * 0.20

        }

        // Tax

        let tax =

            (subtotal - discount) * 0.15

        // Grand Total

        let total = subtotal - discount + shipping + tax

        res.status(200).json({

            cart: user.cart,subtotal,discount,shipping,tax,            total
         
        })

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}