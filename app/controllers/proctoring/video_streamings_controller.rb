require_dependency "proctoring/application_controller"

module Proctoring
  class VideoStreamingsController < ApplicationController
    before_action :set_video_streaming, only: [:show, :edit, :update, :destroy, :upload_video]

    # GET /video_streamings
    def index
      @video_streamings = VideoStreaming.where(status: :active).limit(15)
    end

    # GET /video_streamings/1
    def show
    end

    # GET /video_streamings/new
    def new
      @video_streaming = VideoStreaming.new
    end

    # GET /video_streamings/1/edit
    def edit
    end

    # POST /video_streamings
    def create
      @video_streaming = VideoStreaming.new(video_streaming_params)

      if @video_streaming.save
        redirect_to @video_streaming, notice: 'Video streaming was successfully created.'
      else
        render :new
      end
    end

    # PATCH/PUT /video_streamings/1
    def update
      if @video_streaming.update(video_streaming_params)
        redirect_to @video_streaming, notice: 'Video streaming was successfully updated.'
      else
        render :edit
      end
    end

    # PATCH/PUT /video_streamings/1/upload_video
    def upload_video
      video_streaming = video_streaming_params
      # return unless session[:user_id] != video_streaming[:user_id]
      # video_streaming[:videos] = @video_streaming.all_attached_videos_sign_ids + video_streaming[:videos]
      # p video_streaming
      if @video_streaming.update(video_streaming_params)
        render json: {}, status: :ok
      else
        render json: {}, status: 422
      end
    end

    # DELETE /video_streamings/1
    def destroy
      @video_streaming.stopped!
      redirect_to video_streamings_url, notice: 'Video streaming was successfully destroyed.'
    end

    def event
      @video_streamings = VideoStreaming.by_event(params[:id])
    end

    def user_channel
      user_id = params[:user_id]
      event_id = params[:event_id]
      video_streaming = VideoStreaming.open_join_channel(user_id, event_id)
      render json: { id: video_streaming.id, channel: video_streaming.channel, socketURL: Proctoring.media_server_url }
    end

    def stream_channel
      @media_server_url = Proctoring.media_server_url
      @video_streaming = VideoStreaming.find_by(channel: params[:id])
      @channels = [@video_streaming.channel]
    end

    def stream_room
      @media_server_url = Proctoring.media_server_url
      @video_streaming_room = VideoStreamingRoom.find_by(room: params[:id])
    end

    def distribute_channel_to_rooms
      @no_of_users_in_channel = proctor_user_params[:no_of_users_in_channel].to_i
      @event_id = proctor_user_params[:event_id]
      VideoStreaming.setup_rooms(@event_id, @no_of_users_in_channel)
      @all_rooms = VideoStreamingRoom.where(event_id: @event_id, total_users: @no_of_users_in_channel).active
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_video_streaming
        @video_streaming = VideoStreaming.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def video_streaming_params
        params.require(:video_streaming).permit(:channel, :user_id, :event_id, videos: [], images: [])
      end

      def proctor_user_params
        params.require(:video_streaming).permit(:no_of_users_in_channel, :event_id)
      end
  end
end
