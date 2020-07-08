class VideoProctoringsController < ApplicationController
  before_action :set_video_proctoring, only: [:show, :edit, :update, :destroy]

  # GET /video_proctorings
  def index
    @video_proctorings = VideoProctoring.all
  end

  # GET /video_proctorings/1
  def show
  end

  # GET /video_proctorings/new
  def new
    @video_proctoring = VideoProctoring.new
  end

  # GET /video_proctorings/1/edit
  def edit
  end

  # POST /video_proctorings
  def create
    @video_proctoring = VideoProctoring.new(video_proctoring_params)

    if @video_proctoring.save
      redirect_to @video_proctoring, notice: 'Video proctoring was successfully created.'
    else
      render :new
    end
  end

  # PATCH/PUT /video_proctorings/1
  def update
    if @video_proctoring.update(video_proctoring_params)
      redirect_to @video_proctoring, notice: 'Video proctoring was successfully updated.'
    else
      render :edit
    end
  end

  # DELETE /video_proctorings/1
  def destroy
    @video_proctoring.destroy
    redirect_to video_proctorings_url, notice: 'Video proctoring was successfully destroyed.'
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_video_proctoring
      @video_proctoring = VideoProctoring.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def video_proctoring_params
      params.fetch(:video_proctoring, {})
    end
end
