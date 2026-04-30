Feature PRD: 5-Pillar Review System (Client App)

Project: LihLih Client App (React Native / Expo)
Module: Post-Delivery Experience & Feedback
Design System: Kinetic Oasis (Light Theme)

1. Executive Summary

Once a driver completes a delivery, the transaction loop is closed, but the feedback loop begins. To populate the Review table we designed in Prisma, the Client App must prompt the user to rate their experience across 5 specific metrics: Quality, Accuracy, Packaging, Value, and Speed.
To ensure a high response rate, this UI will be presented as a smooth, non-intrusive BottomSheetModal that appears the next time the user opens the app (or navigates to their order history) after a delivery.

2. Architecture & State Management (Best Practices)

Following our strict separation of concerns:

Server State (Mutations): Use TanStack Query (useMutation) to handle the POST request, loading states, and error handling.

UI Components (Dumb): Reusable interactive components (InteractiveStarRating) that only handle visual state and pass values up via callbacks.

Business Logic: Abstracted entirely into a custom hook (useSubmitReview).

Trigger Logic: A separate hook (useUnreviewedOrders) to check if the user has a recent delivered order that needs a rating.

3. Backend Prerequisites (Node.js/Express)

Before the frontend can submit reviews, the backend needs two new endpoints.

3.1. Fetch Unreviewed Orders

Route: GET /api/orders/client/:id/unreviewed

Logic: Fetch orders where status = 'Delivered' AND the Review relation is null.

export const getUnreviewedOrders = async (req: Request, res: Response) => {
const orders = await prisma.order.findMany({
where: {
client_id: parseInt(req.params.id),
status: 'Delivered',
review: null // Prisma syntax to find orders without a linked review
},
include: { store: true },
orderBy: { created_at: 'desc' },
take: 1 // Only prompt for the most recent unreviewed order
});
res.json(orders);
};

3.2. Submit Review

Route: POST /api/reviews

Body: order_id, store_id, client_id, the 5 ratings, and comment.

Logic: Create the review in the database. Ensure an order cannot be reviewed twice.

4. Component Breakdown: Presentation (Dumb Components)

4.1. InteractiveStarRating.tsx

A highly reusable, isolated UI primitive for capturing a 1-to-5 star rating.

Props: label (string), rating (number), onRatingChange (function).

UI: A row of 5 Lucide Star icons.

Interaction: Tapping a star updates the local state and triggers onRatingChange(value).

Styling: Active stars are filled with #FFB800 (Gold). Inactive stars are outlined with Colors.outlineVariant.

4.2. ReviewBottomSheet.tsx

The modal that slides up to ask for feedback.

Header: "Comment était votre commande chez [Store Name] ?"

Body: \* 5 instances of InteractiveStarRating, each mapped to one of the pillars:

Qualité & Goût (Quality)

Respect des consignes (Accuracy)

Emballage (Packaging)

Rapport Qualité/Prix (Value)

Rapidité de préparation (Speed)

OasisTextArea: Optional comment field ("Un commentaire à ajouter ?").

Footer: KineticButton labeled "Envoyer mon avis".

5. Component Breakdown: Business Logic (Custom Hooks)

5.1. useSubmitReview.ts

This hook manages the local state of the 5 metrics and handles the API submission.

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useSubmitReview = (orderId: number, storeId: number, clientId: number, onSuccessCb: () => void) => {
const queryClient = useQueryClient();

// Local state for the 5 pillars (Default to 0 or 5 depending on UX preference)
const [ratings, setRatings] = useState({
rating_quality: 0,
rating_accuracy: 0,
rating_packaging: 0,
rating_value: 0,
rating_speed: 0,
});
const [comment, setComment] = useState('');

const updateRating = (key: keyof typeof ratings, value: number) => {
setRatings(prev => ({ ...prev, [key]: value }));
};

// Validation: Ensure all 5 metrics have at least 1 star before submitting
const isReady = Object.values(ratings).every(val => val > 0);

const mutation = useMutation({
mutationFn: async () => {
return api.post('/api/reviews', {
order_id: orderId,
store_id: storeId,
client_id: clientId,
...ratings,
comment
});
},
onSuccess: () => {
// Refresh the unreviewed orders list so the modal disappears
queryClient.invalidateQueries({ queryKey: ['unreviewed_orders', clientId] });
onSuccessCb();
}
});

return { ratings, updateRating, comment, setComment, submitReview: mutation.mutate, isPending: mutation.isPending, isReady };
};

6. The User Workflow

The Delivery: The driver inputs the client's 4-digit PIN. The backend marks the order as Delivered.

The Trigger: The next time the client opens the app (or navigates to their "Orders" tab), the useUnreviewedOrders query fetches the recently delivered order.

The Prompt: The ReviewBottomSheet automatically slides up.

The Interaction: The user taps the stars for the 5 metrics. The "Envoyer" button remains disabled (opacity-50) until all 5 metrics have at least 1 star.

The Submission: User taps "Envoyer". The useSubmitReview mutation fires.

The Reward: The modal slides down with a quick success Toast ("Merci pour votre retour !"), and the backend updates the Review table, instantly affecting the store's average rating on the Discovery Feed.

7. Acceptance Criteria

[ ] Backend GET /api/orders/client/:id/unreviewed returns delivered orders without a review.

[ ] Backend POST /api/reviews successfully saves the 5 metrics to the database.

[ ] Frontend InteractiveStarRating component is built without business logic (purely presentational).

[ ] Frontend ReviewBottomSheet dynamically renders the 5 metrics and handles local state via the useSubmitReview hook.

[ ] Submission is blocked (isReady = false) unless the user provides a rating for all 5 pillars.

[ ] Upon successful submission, TanStack Query invalidates the cache, ensuring the review modal does not appear again for that order.
