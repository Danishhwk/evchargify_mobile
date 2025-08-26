import React, {useState, useEffect, memo} from 'react';
import {View, FlatList} from 'react-native';
import {
  Surface,
  Text,
  Divider,
  ProgressBar,
  ActivityIndicator,
} from 'react-native-paper';
import {getStationReviewComments} from '../../services/review_service';
import {Rating} from '@kolking/react-native-rating';
import {images} from '../../assets/images/images';
import moment from 'moment';
import Animated, {FadeInUp} from 'react-native-reanimated';

export default function ReviewInfo({stationId, reviewData}) {
  const [rating, setRating] = useState(0);
  const [ratingData, setRatingData] = useState([]);
  const [totalReview, setTotalReview] = useState(0);
  const [commentData, setCommentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true); // Track if there are more comments

  const commentsPerPage = 10;

  useEffect(() => {
    if (reviewData && reviewData.length > 0) {
      getReviewFun();
    }
  }, [reviewData]);

  // Fetch review data (rating) and calculate ratingData
  const getReviewFun = async () => {
    if (!reviewData || reviewData.length === 0) return;

    setRating(parseFloat(reviewData[0].average_rating));

    const ratingKeys = [
      'rating_1',
      'rating_2',
      'rating_3',
      'rating_4',
      'rating_5',
    ];

    const ratingData = ratingKeys.map((key, index) => {
      const rating = index + 1;
      const progress = Math.min(parseFloat(reviewData[0][key]) / 5, 1);
      return {rating, progress};
    });

    setRatingData(ratingData);

    // Calculate total reviews
    const total = ratingKeys.reduce(
      (acc, key) => acc + parseInt(reviewData[0][key]),
      0,
    );
    setTotalReview(total);

    // Fetch comments
    getCommentsFun();
  };

  // Fetch comments for the current page
  const getCommentsFun = async () => {
    setIsLoading(true);
    const fetchedComments = await getStationReviewComments(
      stationId,
      page,
      commentsPerPage,
    );

    // Check if we have more comments to load
    if (fetchedComments.length < commentsPerPage) {
      setHasMoreComments(false); // No more comments to load
    }

    setCommentData(prevComments => [...prevComments, ...fetchedComments]);
    setIsLoading(false);
    setIsFetchingMore(false);
  };

  // Load more comments when the user scrolls
  const handleLoadMore = () => {
    if (!isFetchingMore && hasMoreComments) {
      setIsFetchingMore(true);
      setPage(prevPage => prevPage + 1);
    }
  };

  // Render the rating card
  const renderRatingCard = item => (
    <View className="flex-row justify-between p-3">
      <View className="items-center">
        <Text className="text-3xl" variant="titleLarge">
          {parseFloat(item.average_rating).toFixed(1)}
        </Text>

        <View className="h-2" />

        <Rating
          size={20}
          fillColor="#6BB14F"
          disabled={true}
          rating={rating}
          fillSymbol={images.star_fill}
          baseSymbol={images.star}
          baseColor="#6BB14F"
        />

        <Text variant="bodyLarge" className="text-gray-500 mt-3">
          ({totalReview} reviews)
        </Text>
      </View>

      <View className="flex-1 flex-col-reverse ml-5">
        {ratingData.map((item, index) => (
          <View key={index} className="flex-row items-center justify-evenly">
            <Text className="" variant="bodyLarge">
              {item.rating}
            </Text>

            <View className="w-[90%]">
              <ProgressBar
                fillStyle={{borderRadius: 20}}
                progress={item.progress}
                className="w-[100%] rounded-full bg-[#DFDFE0]"
                style={{height: 5}}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // Loading state
  if (isLoading && page === 1) {
    return (
      <View className="items-center justify-center h-48">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render comments using FlatList for optimized performance
  return (
    <Animated.FlatList
      entering={FadeInUp.duration(500)}
      needsOffscreenAlphaCompositing
      style={{paddingHorizontal: 10, paddingTop: 10}}
      scrollEnabled={false}
      data={[{ratingCard: true}, ...commentData]}
      renderItem={({item}) => {
        if (item.ratingCard) {
          return renderRatingCard(reviewData[0]);
        } else {
          return (
            <CommentItem
              item={item}
              currentDate={moment(new Date()).format('DD-MM-YYYY')}
            />
          );
        }
      }}
      keyExtractor={(item, index) => index.toString()}
      ListFooterComponent={
        // Show loader only if there are more comments to load
        isFetchingMore ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : null
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1} // Trigger when the user is near the end
    />
  );
}

// Memoize the CommentItem component to prevent unnecessary re-renders
const CommentItem = memo(({item, currentDate}) => {
  const dateFmt = moment(item.add_dt).format('DD-MM-YYYY');
  const sameDay = moment(dateFmt).isSame(currentDate);
  const day = moment(item.add_dt).format('dddd');

  return (
    <View className="mt-5 p-3">
      <View className="flex-row items-center">
        <View className="flex-1 flex-row justify-between">
          <View className="items-start w-[70%]">
            <Text className="mb-1" variant="bodyLarge">
              {item.customer_first_name} {item.customer_last_name}
            </Text>

            <Rating
              size={16}
              fillColor="#6BB14F"
              disabled={true}
              rating={item.customer_rating}
              fillSymbol={images.star_fill}
              baseSymbol={images.star}
              baseColor="#6BB14F"
            />
          </View>

          <View className="items-end justify-between">
            <Text className="text-gray-500" variant="labelLarge">
              {sameDay ? 'Today' : day}
            </Text>
            <Text className="text-gray-500" variant="labelLarge">
              {dateFmt}
            </Text>
          </View>
        </View>
      </View>

      <Text variant="titleSmall" className="mt-3">
        {item.customer_review}
      </Text>

      <Divider className="mt-3" />
    </View>
  );
});
