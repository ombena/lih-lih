import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors, KineticButton, OasisTextArea } from './UIPrimitives';
import InteractiveStarRating from './InteractiveStarRating';
import { useSubmitReview } from '../hooks/useSubmitReview';

interface Props {
  order: any;
  clientId: number;
}

export default function ReviewBottomSheet({ order, clientId }: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['85%'], []);
  const [isSuccess, setIsSuccess] = useState(false);

  const { 
    ratings, 
    updateRating, 
    comment, 
    setComment, 
    submitReview, 
    isPending, 
    isReady 
  } = useSubmitReview(
    order.id, 
    order.store_id, 
    clientId, 
    () => {
      setIsSuccess(true);
      setTimeout(() => {
        bottomSheetModalRef.current?.dismiss();
      }, 2000);
    }
  );

  useEffect(() => {
    if (order) {
      bottomSheetModalRef.current?.present();
    }
  }, [order]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  if (isSuccess) {
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
      >
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Merci pour votre avis !</Text>
          <Text style={styles.successSubtitle}>
            Vos retours aident {order.store?.name} à s'améliorer.
          </Text>
        </View>
      </BottomSheetModal>
    );
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={!isPending}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>
          Comment était votre commande chez {order.store?.name} ?
        </Text>
        
        <View style={styles.ratingsContainer}>
          <InteractiveStarRating 
            label="Qualité & Goût" 
            rating={ratings.rating_quality} 
            onRatingChange={(v) => updateRating('rating_quality', v)} 
          />
          <InteractiveStarRating 
            label="Respect des consignes" 
            rating={ratings.rating_accuracy} 
            onRatingChange={(v) => updateRating('rating_accuracy', v)} 
          />
          <InteractiveStarRating 
            label="Emballage & Présentation" 
            rating={ratings.rating_packaging} 
            onRatingChange={(v) => updateRating('rating_packaging', v)} 
          />
          <InteractiveStarRating 
            label="Rapport Qualité/Prix" 
            rating={ratings.rating_value} 
            onRatingChange={(v) => updateRating('rating_value', v)} 
          />
          <InteractiveStarRating 
            label="Rapidité de préparation" 
            rating={ratings.rating_speed} 
            onRatingChange={(v) => updateRating('rating_speed', v)} 
          />
        </View>

        <OasisTextArea 
          placeholder="Un commentaire à ajouter ? (Optionnel)"
          value={comment}
          onChangeText={setComment}
          bottomSheet
        />

        <KineticButton 
          title={isPending ? "Envoi..." : "Envoyer mon avis"}
          onPress={() => {
            Keyboard.dismiss();
            submitReview();
          }}
          variant={isReady ? 'primary' : 'secondary'}
          style={{ marginTop: 20 }}
          disabled={!isReady || isPending}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
  },
  ratingsContainer: {
    marginBottom: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.onSurface,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 10,
  }
});
